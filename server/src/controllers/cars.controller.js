// src/controllers/cars.controller.js
import { prisma } from '../config/db.js';
import { activeDealerVisibility } from '../utils/subscription.js';

const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
const parseBoolean = (value) => value === 'true' || value === true;
const hasField = (data, field) => Object.prototype.hasOwnProperty.call(data, field);

const getDealerForUser = async (userId) =>
  prisma.dealer.findUnique({ where: { userId } });

const ensureCanManageCar = async (req, car) => {
  if (adminRoles.includes(req.user.role)) return true;

  const dealer = await getDealerForUser(req.user.id);
  if (!dealer) return false;

  return car.dealerId === dealer.id;
};

export const getCars = async (req, res, next) => {
  try {
    const {
      make, bodyType, fuel, transmission, condition,
      minPrice, maxPrice, minYear, maxYear,
      search, featured, page = 1, limit = 12, sort = 'createdAt'
    } = req.query;

    const where = { status: 'AVAILABLE' };
    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (bodyType) where.bodyType = bodyType;
    if (fuel) where.fuel = fuel;
    if (transmission) where.transmission = transmission;
    if (condition) where.condition = condition;
    if (featured === 'true') where.featured = true;
    if (minPrice || maxPrice) where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
    if (minYear || maxYear) where.year = {};
    if (minYear) where.year.gte = parseInt(minYear);
    if (maxYear) where.year.lte = parseInt(maxYear);
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Hide cars from dealers whose subscription has lapsed (house listings always
    // show). Kept under AND so it composes with the search OR above rather than
    // overwriting it.
    where.AND = [{ OR: activeDealerVisibility() }];

    const orderBy = sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'year' ? { year: 'desc' }
      : { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, orderBy, skip, take: parseInt(limit) }),
      prisma.car.count({ where })
    ]);

    res.json({ cars, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const getCarById = async (req, res, next) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) { next(err); }
};

export const createCar = async (req, res, next) => {
  try {
    const newImages = req.files?.map(f => f.path) || [];
    const { existingImages: _, dealerId: submittedDealerId, featured: __, ...bodyData } = req.body;
    const isAdmin = adminRoles.includes(req.user.role);
    let dealerId = isAdmin ? submittedDealerId || null : null;

    if (req.user.role === 'DEALER') {
      // requireActiveSubscription already loaded & verified the dealer.
      const dealer = req.dealer || await getDealerForUser(req.user.id);
      if (!dealer) return res.status(404).json({ message: 'Dealer profile not found' });
      dealerId = dealer.id;
    }

    const car = await prisma.car.create({
      data: {
        ...bodyData,
        dealerId,
        images: newImages,
        price: parseFloat(req.body.price),
        year: parseInt(req.body.year),
        mileage: req.body.mileage ? parseInt(req.body.mileage) : 0,
        horsepower: req.body.horsepower ? parseInt(req.body.horsepower) : null,
        featured: isAdmin ? parseBoolean(req.body.featured) : false
      }
    });
    res.status(201).json(car);
  } catch (err) { next(err); }
};

export const updateCar = async (req, res, next) => {
  try {
    const existingCar = await prisma.car.findUnique({ where: { id: req.params.id } });
    if (!existingCar) return res.status(404).json({ message: 'Car not found' });

    const canManage = await ensureCanManageCar(req, existingCar);
    if (!canManage) return res.status(403).json({ message: 'You can only update your own cars' });

    const newImages = req.files?.map(f => f.path) || [];
    let existingImages = [];
    if (req.body.existingImages) {
      try { existingImages = JSON.parse(req.body.existingImages); } catch {}
    }
    existingImages = existingImages.filter(src => existingCar.images.includes(src));
    const images = [...existingImages, ...newImages];
    const { existingImages: _, dealerId: __, featured: submittedFeatured, ...rest } = req.body;
    const isAdmin = adminRoles.includes(req.user.role);

    const car = await prisma.car.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(images.length > 0 && { images }),
        price: rest.price ? parseFloat(rest.price) : undefined,
        year: rest.year ? parseInt(rest.year) : undefined,
        mileage: rest.mileage ? parseInt(rest.mileage) : undefined,
        horsepower: hasField(rest, 'horsepower')
          ? (rest.horsepower ? parseInt(rest.horsepower) : null)
          : undefined,
        ...(isAdmin && submittedFeatured !== undefined && { featured: parseBoolean(submittedFeatured) })
      }
    });
    res.json(car);
  } catch (err) { next(err); }
};

export const deleteCar = async (req, res, next) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const canManage = await ensureCanManageCar(req, car);
    if (!canManage) return res.status(403).json({ message: 'You can only delete your own cars' });

    await prisma.car.delete({ where: { id: req.params.id } });
    res.json({ message: 'Car deleted' });
  } catch (err) { next(err); }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;
    const existing = await prisma.favorite.findUnique({ where: { userId_carId: { userId, carId } } });
    if (existing) {
      await prisma.favorite.delete({ where: { userId_carId: { userId, carId } } });
      return res.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId, carId } });
    res.json({ favorited: true });
  } catch (err) { next(err); }
};

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { car: true }
    });
    res.json(favorites.map(f => f.car));
  } catch (err) { next(err); }
};
