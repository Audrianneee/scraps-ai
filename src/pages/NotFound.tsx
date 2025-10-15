import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md p-6">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-2xl text-muted-foreground">Oops! Page not found</p>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button variant="default" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
