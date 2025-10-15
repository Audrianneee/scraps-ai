import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="absolute top-6 right-6">
        {user && (
          <Button variant="outline" onClick={() => navigate("/profile")}>
            <User className="w-4 h-4 mr-2" />
            My Profile
          </Button>
        )}
      </div>
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
