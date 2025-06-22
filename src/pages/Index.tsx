
import PhotoAlbumUploader from "@/components/PhotoAlbumUploader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23fb923c\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10">
        <PhotoAlbumUploader />
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500">
        <p>สร้างด้วย React + GSAP + TailwindCSS</p>
        <div className="flex justify-center items-center gap-2 mt-2">
          <span>✨</span>
          <span>Glamorous Photo Album Experience</span>
          <span>✨</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
