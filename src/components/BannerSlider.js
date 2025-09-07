
export default function BannerSlider({ banners }) {
    return (
        <div style={{ display: 'flex', overflowX: 'auto', gap: '8px' }}>
            {banners.map((src, index) => (
                <img key={index} src={src} alt={`banner-${index}`} style={{ width: '100%', }} />
            ))}
        </div>
    );
}