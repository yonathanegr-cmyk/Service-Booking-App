import { memo } from 'react';

interface PriceMarkerProps {
  name: string;
  price: number;
  image?: string;
  isLowest?: boolean;
  isActive?: boolean;
}

export const PriceMarker = memo(function PriceMarker({ 
  name, 
  price, 
  image,
  isLowest = false,
  isActive = false 
}: PriceMarkerProps) {
  const firstName = name.split(' ')[0];
  
  return (
    <div 
      className={`
        marker-price
        ${isActive ? 'marker-active' : ''}
        ${isLowest ? 'marker-lowest' : ''}
      `}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.15s ease-out, z-index 0s',
        transform: isActive ? 'scale(1.15)' : 'scale(1)',
        zIndex: isActive ? 100 : 10,
      }}
    >
      <div 
        style={{
          background: isLowest ? '#22c55e' : 'white',
          color: isLowest ? 'white' : '#1f2937',
          borderRadius: '24px',
          padding: '8px 14px',
          boxShadow: isActive 
            ? '0 8px 25px rgba(0,0,0,0.25)' 
            : '0 2px 8px rgba(0,0,0,0.15)',
          border: `2px solid ${isActive ? '#3b82f6' : (isLowest ? '#22c55e' : '#e5e7eb')}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
        }}
      >
        {image ? (
          <img 
            src={image} 
            alt={name}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=28`;
            }}
          />
        ) : (
          <div 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isLowest ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLowest ? '#22c55e' : 'white',
              fontWeight: 'bold',
              fontSize: '12px',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {name.charAt(0)}
          </div>
        )}
        
        <div style={{ textAlign: 'right' }}>
          <div 
            style={{ 
              fontWeight: 600, 
              fontSize: '13px',
              lineHeight: 1.2,
              color: isLowest ? 'white' : '#374151',
            }}
          >
            {firstName}
          </div>
          <div 
            style={{ 
              fontWeight: 700, 
              fontSize: '15px',
              lineHeight: 1.2,
              color: isLowest ? 'white' : '#2563eb',
            }}
          >
            ₪{price}
          </div>
        </div>
      </div>
      
      <div 
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `8px solid ${isActive ? '#3b82f6' : (isLowest ? '#22c55e' : 'white')}`,
          marginTop: '-1px',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
        }}
      />
    </div>
  );
});

export function createPriceMarkerHTML(
  name: string, 
  price: number, 
  image: string | undefined,
  isLowest: boolean
): string {
  const firstName = name.split(' ')[0];
  const bgColor = isLowest ? '#22c55e' : 'white';
  const textColor = isLowest ? 'white' : '#374151';
  const priceColor = isLowest ? 'white' : '#2563eb';
  const borderColor = isLowest ? '#22c55e' : '#e5e7eb';
  const avatarBg = isLowest ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const avatarTextColor = isLowest ? '#22c55e' : 'white';

  return `
    <div class="price-marker-container" style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.15s ease-out;
    ">
      <div class="price-marker-bubble" style="
        background: ${bgColor};
        border-radius: 24px;
        padding: 8px 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        border: 2px solid ${borderColor};
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      ">
        ${image ? `
          <img 
            src="${image}" 
            alt="${name}"
            style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            "
            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=28'"
          />
        ` : `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${avatarBg};
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${avatarTextColor};
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          ">${name.charAt(0)}</div>
        `}
        <div style="text-align: right;">
          <div style="
            font-weight: 600;
            font-size: 13px;
            line-height: 1.2;
            color: ${textColor};
          ">${firstName}</div>
          <div style="
            font-weight: 700;
            font-size: 15px;
            line-height: 1.2;
            color: ${priceColor};
          ">₪${price}</div>
        </div>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid ${isLowest ? '#22c55e' : 'white'};
        margin-top: -1px;
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
      "></div>
    </div>
  `;
}

export default PriceMarker;
