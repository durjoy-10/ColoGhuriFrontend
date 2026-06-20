import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaCompass,
    FaPlane,
    FaShieldAlt,
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden bg-dark-950 text-white">
            <div className="floating-blob -left-20 top-10 h-72 w-72 bg-primary-600/20"></div>
            <div className="floating-blob -right-20 bottom-10 h-80 w-80 bg-secondary-600/20"></div>

            <div className="container-custom relative z-10 py-14">
                <div className="grid gap-10 lg:grid-cols-4 md:grid-cols-2">
                    <div>
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-travel-gradient shadow-glow">
                                <span className="text-2xl">🌍</span>
                            </div>
                            <div>
                                <h3 className="font-display text-2xl font-extrabold">
                                    Colo Ghuri
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Explore Bangladesh beautifully
                                </p>
                            </div>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                            Your smart travel companion for discovering destinations,
                            booking guided tours, and planning memorable trips across Bangladesh.
                        </p>

                        <div className="mt-6 flex gap-3">
                            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, index) => (
                                <button
                                    key={index}
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-300 transition hover:-translate-y-1 hover:bg-primary-600 hover:text-white"
                                >
                                    <Icon />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-5 font-display text-lg font-bold">
                            Explore
                        </h4>

                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/destinations" className="text-slate-400 transition hover:text-primary-300">
                                    Destinations
                                </Link>
                            </li>
                            <li>
                                <Link to="/tours" className="text-slate-400 transition hover:text-primary-300">
                                    Tours
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-slate-400 transition hover:text-primary-300">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-slate-400 transition hover:text-primary-300">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-5 font-display text-lg font-bold">
                            Services
                        </h4>

                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-center gap-3">
                                <FaCompass className="text-primary-400" />
                                Destination discovery
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPlane className="text-primary-400" />
                                Personal trip planner
                            </li>
                            <li className="flex items-center gap-3">
                                <FaShieldAlt className="text-primary-400" />
                                Verified guide groups
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-5 font-display text-lg font-bold">
                            Contact
                        </h4>

                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="mt-1 text-primary-400" />
                                Bangladesh
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="text-primary-400" />
                                +880 1234 567890
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="text-primary-400" />
                                info@cologhuri.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-sm text-slate-500 md:flex-row">
                    <p>
                        © {currentYear} Colo Ghuri. All rights reserved.
                    </p>
                    <p>
                        Built for travellers, guides, and local tourism.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;