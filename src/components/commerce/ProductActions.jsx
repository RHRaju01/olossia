import React from "react";
import { ActionButton } from "../ui/ActionButton";

export const ProductActions = React.memo(
  ({
    product,
    onAddToCart,
    onAddToWishlist,
    onAddToCompare,
    onQuickView,
    isInWishlist,
    isInCompare,
    isInCart,
    showQuickView = true,
    layout = "vertical", // 'vertical' | 'horizontal'
    showText = false,
    className = "",
  }) => {
    const containerClass =
      layout === "horizontal"
        ? `flex items-center gap-3 ${className}`
        : `flex flex-col gap-2 ${className}`;

    return (
      <div className={containerClass}>
        <ActionButton
          type="wishlist"
          isActive={isInWishlist(product.id)}
          onClick={() => onAddToWishlist(product)}
          showText={showText}
          className="w-10 h-10"
        />

        {showQuickView && (
          <ActionButton
            type="quickview"
            onClick={(e) => {
              e.stopPropagation();
              if (layout === "horizontal") {
                // In horizontal layout, go to product details page
                window.location.href = `/product/${product.id}`;
              } else {
                // In vertical layout, show quick view overlay
                onQuickView(product);
              }
            }}
            showText={showText}
            className="w-10 h-10"
          />
        )}

        <ActionButton
          type="compare"
          isActive={isInCompare(product.id)}
          onClick={() => onAddToCompare(product)}
          showText={showText}
          className="w-10 h-10"
        />

        <ActionButton
          type="cart"
          isActive={isInCart(product.id)}
          onClick={() => onAddToCart(product)}
          showText={showText}
          className="w-10 h-10"
        />
      </div>
    );
  }
);

ProductActions.displayName = "ProductActions";
