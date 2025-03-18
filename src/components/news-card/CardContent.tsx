
interface CardContentProps {
  summary: string;
  imageUrl?: string;
}

const CardContent = ({ summary, imageUrl }: CardContentProps) => {
  return (
    <>
      <p className="text-sm text-gray-600 line-clamp-4">{summary}</p>
      
      {imageUrl && (
        <div className="mt-3 h-32 overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt="Article image"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />
        </div>
      )}
    </>
  );
};

export default CardContent;
