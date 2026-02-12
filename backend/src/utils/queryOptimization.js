/**
 * Query Optimization Utilities
 * 
 * Provides reusable utilities for optimizing database queries:
 * - Cursor-based pagination
 * - Lean query helpers
 * - Field selection
 * - Aggregation pipeline builders
 */

/**
 * Encode cursor for pagination
 * @param {Object} data - Data to encode (e.g., { _id: '...', createdAt: Date })
 * @returns {string} Base64 encoded cursor
 */
export const encodeCursor = (data) => {
  if (!data) return null;
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

/**
 * Decode cursor for pagination
 * @param {string} cursor - Base64 encoded cursor
 * @returns {Object|null} Decoded cursor data
 */
export const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch (error) {
    return null;
  }
};

/**
 * Build cursor-based pagination query
 * @param {string} cursor - Cursor from previous page
 * @param {Object} sortField - Sort field (e.g., { createdAt: -1 })
 * @returns {Object} Query object for MongoDB
 */
export const buildCursorQuery = (cursor, sortField = { createdAt: -1 }) => {
  const decodedCursor = decodeCursor(cursor);
  if (!decodedCursor) return {};

  const [field, direction] = Object.entries(sortField)[0];
  const operator = direction === 1 ? '$gt' : '$lt';

  // Build query based on cursor
  const query = {};
  
  if (decodedCursor[field]) {
    query[field] = { [operator]: decodedCursor[field] };
  }

  // Add _id for tie-breaking if field values are the same
  if (decodedCursor._id && field !== '_id') {
    query._id = { [operator]: decodedCursor._id };
  }

  return query;
};

/**
 * Build pagination response with cursor
 * @param {Array} items - Array of documents
 * @param {number} limit - Items per page
 * @param {Object} sortField - Sort field used
 * @returns {Object} Pagination metadata
 */
export const buildPaginationResponse = (items, limit, sortField = { createdAt: -1 }) => {
  const hasNextPage = items.length > limit;
  const results = hasNextPage ? items.slice(0, limit) : items;
  
  let nextCursor = null;
  if (hasNextPage && results.length > 0) {
    const lastItem = results[results.length - 1];
    const [field] = Object.keys(sortField);
    
    nextCursor = encodeCursor({
      [field]: lastItem[field],
      _id: lastItem._id,
    });
  }

  return {
    results,
    hasNextPage,
    nextCursor,
  };
};

/**
 * Apply lean query optimization
 * Wrapper to apply .lean() with option to transform results
 * @param {Object} query - Mongoose query
 * @param {boolean} shouldLean - Whether to apply lean
 * @returns {Object} Query with lean applied if needed
 */
export const applyLean = (query, shouldLean = true) => {
  return shouldLean ? query.lean() : query;
};

/**
 * Select only necessary fields from populated documents
 * @param {string} path - Path to populate
 * @param {string} fields - Space-separated field names
 * @returns {Object} Populate options
 */
export const selectFields = (path, fields) => {
  return { path, select: fields };
};

/**
 * Build aggregation pipeline for paginated product search
 * @param {Object} matchQuery - MongoDB match query
 * @param {Object} sortOption - Sort options
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Number of documents to return
 * @returns {Array} Aggregation pipeline
 */
export const buildProductSearchPipeline = (matchQuery, sortOption, skip, limit) => {
  return [
    { $match: matchQuery },
    { $sort: sortOption },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'shops',
        localField: 'shop',
        foreignField: '_id',
        as: 'shop',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$shop',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        price: 1,
        originalPrice: 1,
        brand: 1,
        soldCount: 1,
        stock: 1,
        category: 1,
        subcategory: 1,
        images: 1,
        averageRating: 1,
        totalReviews: 1,
        variants: 1,
        createdAt: 1,
        updatedAt: 1,
        'vendor.shopName': 1,
        'vendor._id': 1,
        'shop.name': 1,
        'shop.logoUrl': 1,
        'shop._id': 1,
      },
    },
  ];
};

/**
 * Build aggregation pipeline for user orders with review status
 * @param {string} clerkId - User's clerk ID
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Number of documents to return
 * @returns {Array} Aggregation pipeline
 */
export const buildUserOrdersPipeline = (clerkId, skip = 0, limit = 20) => {
  return [
    { $match: { clerkId } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'orderId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        hasReviewed: { $gt: [{ $size: '$reviews' }, 0] },
        orderItems: {
          $map: {
            input: '$orderItems',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                {
                  product: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDetails',
                          cond: { $eq: ['$$this._id', '$$item.product'] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        productDetails: 0,
        reviews: 0,
      },
    },
  ];
};

/**
 * Build aggregation pipeline for review rating calculation
 * @param {string} productId - Product ID
 * @returns {Array} Aggregation pipeline
 */
export const buildReviewStatsAggregate = (productId) => {
  return [
    { $match: { productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ];
};

/**
 * Parse pagination parameters from request
 * @param {Object} query - Request query object
 * @returns {Object} Parsed pagination params
 */
export const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const cursor = query.cursor || null;
  const useCursor = query.useCursor === 'true' || !!cursor;

  return {
    page,
    limit,
    cursor,
    useCursor,
    skip: (page - 1) * limit,
  };
};
