import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productAPI from '../services/api/productAPI';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCompare } from '../contexts/CompareContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist } = useWishlist();
  const { addItem: addToCompare } = useCompare();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getById(id);
        if (response && response.data) {
          setProduct(response.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <div className='text-lg text-gray-600'>Loading product...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mb-4 text-6xl text-gray-400'>⚠️</div>
          <div className='mb-4 text-xl text-red-600'>{error}</div>
          <button
            onClick={() => navigate(-1)}
            className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mb-4 text-6xl text-gray-400'>📦</div>
          <div className='mb-4 text-xl text-gray-600'>Product not found</div>
          <button
            onClick={() => navigate('/products')}
            className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 px-4 py-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Breadcrumb */}
        <nav className='mb-8'>
          <ol className='flex items-center space-x-2 text-sm text-gray-500'>
            <li>
              <button onClick={() => navigate('/')} className='hover:text-blue-600'>
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/products')} className='hover:text-blue-600'>
                Products
              </button>
            </li>
            <li>/</li>
            <li className='font-medium text-gray-900'>{product.name}</li>
          </ol>
        </nav>

        <div className='overflow-hidden rounded-lg bg-white shadow-lg'>
          <div className='grid grid-cols-1 gap-8 p-8 lg:grid-cols-2'>
            {/* Product Image */}
            <div className='space-y-4'>
              <div className='relative aspect-square overflow-hidden rounded-lg bg-gray-100'>
                {!imageError ? (
                  <img
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className='h-full w-full object-cover transition-opacity duration-300'
                    onError={() => setImageError(true)}
                    loading='lazy'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-gray-200'>
                    <div className='text-center text-gray-500'>
                      <div className='mb-2 text-4xl'>📷</div>
                      <div>Image not available</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className='space-y-6'>
              <div className='space-y-4'>
                <div>
                  <h1 className='mb-2 text-3xl font-bold text-gray-900'>{product.name}</h1>
                  {product.brand && (
                    <p className='mb-2 text-lg text-gray-600'>by {product.brand}</p>
                  )}
                  {product.description && (
                    <p className='leading-relaxed text-gray-600'>{product.description}</p>
                  )}
                </div>

                <div className='flex items-center space-x-4'>
                  <span className='text-3xl font-bold text-blue-600'>
                    ${product.price?.toFixed(2) || '0.00'}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className='text-xl text-gray-500 line-through'>
                      ${product.original_price.toFixed(2)}
                    </span>
                  )}
                  {product.original_price && product.original_price > product.price && (
                    <span className='rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-800'>
                      {Math.round(
                        ((product.original_price - product.price) / product.original_price) * 100
                      )}
                      % OFF
                    </span>
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className='flex items-center space-x-2'>
                    <div className='flex text-yellow-400'>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className='text-gray-600'>
                      ({product.rating.toFixed(1)}) • {product.reviews_count || 0} reviews
                    </span>
                  </div>
                )}

                {/* Stock Status */}
                <div className='flex items-center space-x-2'>
                  <div
                    className={`h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  <span
                    className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-4'>
                <div className='flex space-x-4'>
                  <button
                    onClick={() => {
                      if (product.stock > 0) {
                        addToCart(product);
                      }
                    }}
                    disabled={product.stock === 0}
                    className={`flex-1 rounded-lg px-6 py-3 font-medium transition-colors ${
                      product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={() => addToWishlist(product)}
                    className='rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50'
                  >
                    ♥ Wishlist
                  </button>
                </div>
                <div className='flex space-x-4'>
                  <button
                    onClick={() => addToCompare(product)}
                    className='flex items-center space-x-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50'
                  >
                    <span>⚖️</span>
                    <span>Compare</span>
                  </button>
                </div>

                {/* Additional Product Info */}
                {(product.category || product.tags) && (
                  <div className='space-y-2 border-t pt-4'>
                    {product.category && (
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-gray-500'>Category:</span>
                        <span className='rounded bg-gray-100 px-2 py-1 text-sm'>
                          {product.category}
                        </span>
                      </div>
                    )}
                    {product.tags && (
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-gray-500'>Tags:</span>
                        <div className='flex flex-wrap gap-1'>
                          {product.tags.split(',').map((tag, index) => (
                            <span
                              key={index}
                              className='rounded bg-blue-100 px-2 py-1 text-sm text-blue-800'
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
