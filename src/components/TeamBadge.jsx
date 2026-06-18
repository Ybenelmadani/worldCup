const TeamBadge = ({ src, alt, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';

    return (
        <div className={`flex ${sizeClass} items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm`}>
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full bg-slate-100" />
            )}
        </div>
    );
};

export default TeamBadge;
