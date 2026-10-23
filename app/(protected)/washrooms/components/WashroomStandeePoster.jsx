import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const WashroomStandeePoster = React.forwardRef(({ location, style }, ref) => {
  // Extract companyId safely
  const companyId = location?.company_id || location?.companyId || location?.company?.id || '';
  const isTadoba = String(companyId).trim() === '95';

  // Dynamic feedback URL pointing to user-review with locationId and companyId
  const feedbackUrl = isTadoba
    ? `https://portal.saafai.in/feedback/tadoba?locationId=${location?.id || ''}&companyId=${companyId}`
    : `https://portal.saafai.in/feedback?locationId=${location?.id || ''}&companyId=${companyId}`;

  // Image template selection: Tadoba (company 95) vs Default
  const posterSrc = isTadoba
    ? '/images/SaafAI_Tadoba_Feedback_Forest_Poster.png'
    : '/images/SaafAI_Default_Poster.png';

  // Precision QR Overlay Card Styles (tested & aligned with zero dummy QR bleed)
  const qrCardStyle = isTadoba
    ? {
        position: 'absolute',
        top: '34.8%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '36.0%',
        height: '22.8%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px',
        padding: '3%',
      }
    : {
        position: 'absolute',
        top: '38.0%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '37.5%',
        height: '23.8%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px',
        padding: '3%',
      };

  return (
    <div 
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '724px',
        aspectRatio: '1086 / 1448',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        margin: '0 auto',
        ...style
      }}
    >
      {/* Background Template Image */}
      <img 
        src={posterSrc} 
        alt={isTadoba ? "Tadoba Feedback Standee" : "SaafAI Feedback Standee"} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }} 
      />

      {/* Dynamic QR Code Overlay */}
      <div style={qrCardStyle}>
        <QRCodeSVG 
          value={feedbackUrl} 
          size={500}
          level="H" 
          includeMargin={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
});

WashroomStandeePoster.displayName = 'WashroomStandeePoster';

export default WashroomStandeePoster;