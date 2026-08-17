import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="page-section max-w-xl mx-auto text-center">
        <h1 className="heading-section mb-4">404</h1>
        <p className="body-editorial mx-auto mb-4">Oops! Page not found</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Schedule
        </Link>
      </section>
    </Layout>
  );
};

export default NotFound;
