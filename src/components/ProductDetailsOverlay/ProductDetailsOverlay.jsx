import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { X, Heart, ShoppingBag, Star, Plus, Minus, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export const ProductDetailsOverlay = ({ product, isOpen, onClose, onViewFullDetails }) => {
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock product data structure for overlay
  const overlayProduct = product
    ? {
        ...product,
        images: product.images || [product.image],
        colors: product.colors?.map((color, index) => ({
          name: ['Black', 'Navy', 'Burgundy'][index] || `Color ${index + 1}`,
          value: color,
        })) || [{ name: 'Default', value: '#000000' }],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description:
          'Premium quality fashion piece crafted with attention to detail. Perfect for both casual and formal occasions.',
        features: ['Premium materials', 'Comfortable fit', 'Easy care', 'Versatile styling'],
      }
    : null;

  const handleAddToCart = useCallback(async () => {
    if (!overlayProduct) return;
    const cartItem = {
      ...overlayProduct,
      quantity,
      size: selectedSize,
      color: overlayProduct.colors[selectedColor].name,
      image: overlayProduct.images[0],
    };

    await addToCart(cartItem);
  }, [addToCart, overlayProduct, quantity, selectedSize, selectedColor]);

  const handleAddToWishlist = useCallback(async () => {
    if (!overlayProduct) return;
    await addToWishlist({
      ...overlayProduct,
      image: overlayProduct.images[0],
      colors: overlayProduct.colors.map(c => c.value),
    });
  }, [addToWishlist, overlayProduct]);

  if (!isOpen || !product) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />

      {/* Modal content */}
      <div className='scrollbar-hide relative max-h-[90vh] w-full max-w-4xl overflow-y-auto'>
        <Card className='overflow-hidden rounded-3xl border-0 bg-white shadow-2xl'>
          <CardContent className='p-0'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-100 p-6'>
              <div>
                <p className='text-sm font-bold uppercase tracking-wider text-purple-600'>
                  {overlayProduct.brand}
                </p>
                <h2 className='text-2xl font-bold text-gray-900'>{overlayProduct.name}</h2>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                className='h-10 w-10 rounded-full hover:bg-gray-100'
              >
                <X className='h-5 w-5' />
              </Button>
            </div>

            <div className='grid grid-cols-1 gap-8 p-6 lg:grid-cols-2'>
              {/* Product Images */}
              <div className='space-y-4'>
                {/* Main Image */}
                <div className='relative overflow-hidden rounded-2xl bg-gray-100'>
                  <img
                    src={overlayProduct.images[selectedImage]}
                    alt={overlayProduct.name}
                    className='h-96 w-full object-cover'
                    loading='lazy'
                  />
                  {overlayProduct.originalPrice && (
                    <div className='absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white'>
                      SALE
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {overlayProduct.images.length > 1 && (
                  <div className='flex gap-2 overflow-x-auto'>
                    {overlayProduct.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImage === index
                            ? 'border-purple-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${overlayProduct.name} ${index + 1}`}
                          className='h-full w-full object-cover'
                          loading='lazy'
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className='space-y-6'>
                {/* Rating */}
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(overlayProduct.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className='text-sm font-medium text-gray-600'>
                    {overlayProduct.rating || 4.5} ({overlayProduct.reviews || 100} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className='flex items-center gap-4'>
                  <span className='text-3xl font-black text-gray-900'>${overlayProduct.price}</span>
                  {overlayProduct.originalPrice && (
                    <>
                      <span className='text-xl text-gray-400 line-through'>
                        ${overlayProduct.originalPrice}
                      </span>
                      <span className='rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700'>
                        Save ${overlayProduct.originalPrice - overlayProduct.price}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className='leading-relaxed text-gray-700'>{overlayProduct.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className='mb-3 font-bold text-gray-900'>Key Features:</h4>
                  <ul className='space-y-2'>
                    {overlayProduct.features.map((feature, index) => (
                      <li key={index} className='flex items-center gap-2'>
                        <Check className='h-4 w-4 flex-shrink-0 text-green-500' />
                        <span className='text-sm text-gray-700'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900'>
                    Color:{' '}
                    <span className='font-normal'>{overlayProduct.colors[selectedColor].name}</span>
                  </h3>
                  <div className='flex gap-2'>
                    {overlayProduct.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(index)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          selectedColor === index
                            ? 'scale-110 border-purple-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900'>
                    Size: <span className='font-normal'>{selectedSize}</span>
                  </h3>
                  <div className='flex gap-2'>
                    {overlayProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 w-10 rounded-lg border-2 font-semibold transition-all ${
                          selectedSize === size
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className='mb-3 font-semibold text-gray-900'>Quantity</h3>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center rounded-xl bg-gray-100'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className='h-10 w-10 rounded-xl hover:bg-gray-200'
                      >
                        <Minus className='h-4 w-4' />
                      </Button>
                      <span className='w-10 text-center font-bold'>{quantity}</span>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setQuantity(quantity + 1)}
                        className='h-10 w-10 rounded-xl hover:bg-gray-200'
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                    <span className='text-sm text-gray-600'>
                      Total:{' '}
                      <span className='font-bold text-gray-900'>
                        ${(overlayProduct.price * quantity).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-3'>
                  <Button
                    onClick={handleAddToCart}
                    className='w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
                  >
                    <ShoppingBag className='mr-2 h-4 w-4' />
                    Add to Cart - ${(overlayProduct.price * quantity).toFixed(2)}
                  </Button>

                  <div className='grid grid-cols-2 gap-3'>
                    <Button
                      variant='outline'
                      onClick={handleAddToWishlist}
                      className='rounded-xl py-2 font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                    >
                      <Heart className='mr-2 h-4 w-4' />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        onViewFullDetails(overlayProduct.id);
                        onClose();
                      }}
                      className='rounded-xl bg-gray-900 py-2 font-semibold text-white hover:bg-gray-800'
                    >
                      Full Details
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
