import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, Users, Activity } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/use-role';
import { useUser } from '@clerk/clerk-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { role, isLoaded } = useRole();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const disableNav = pathname.startsWith('/patient');

  const handleGetStarted = () => {
    if (!isSignedIn) {
      navigate('/sign-up');
    } else if (!isLoaded) {
      // Still loading role
      return;
    } else if (!role) {
      navigate('/select-role');
    } else {
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Swasthya<span className='text-green-600 font-extrabold'>Flow</span></h1>
              <p className="text-xs text-muted-foreground">Management Software</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {disableNav ? (
              <span className="text-muted-foreground opacity-60 cursor-not-allowed select-none">
                Features
              </span>
            ) : (
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                Features
              </a>
            )}
            {role === 'doctor' && (
              <Link to="/doctor" className="text-foreground hover:text-primary transition-colors">
                Doctor Dashboard
              </Link>
            )}
            {role === 'patient' && (
              <Link to="/patient" className="text-foreground hover:text-primary transition-colors">
                Patient Dashboard
              </Link>
            )}
            {disableNav ? (
              <span className="text-muted-foreground opacity-60 cursor-not-allowed select-none">
                Patient Portal
              </span>
            ) : (
              <a href="#patients" className="text-foreground hover:text-primary transition-colors">
                Patient Portal
              </a>
            )}
            {disableNav ? (
              <span className="text-muted-foreground opacity-60 cursor-not-allowed select-none">
                Contact
              </span>
            ) : (
              <Link
                to="/contact"
                className="text-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <Link to="/sign-in">
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Button className="bg-gradient-primary" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {disableNav ? (
                <span className="block px-3 py-2 text-muted-foreground opacity-60 cursor-not-allowed select-none">
                  Features
                </span>
              ) : (
                <a
                  href="#features"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
              )}
              <a
                href="#dashboard"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
              {disableNav ? (
                <span className="block px-3 py-2 text-muted-foreground opacity-60 cursor-not-allowed select-none">
                  Patient Portal
                </span>
              ) : (
                <a
                  href="#patients"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Patient Portal
                </a>
              )}
              {disableNav ? (
                <span className="block px-3 py-2 text-muted-foreground opacity-60 cursor-not-allowed select-none">
                  Contact
                </span>
              ) : (
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              )}
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <SignedOut>
                  <Link to="/sign-in">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <div className="px-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
                <Button className="bg-gradient-primary" size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;