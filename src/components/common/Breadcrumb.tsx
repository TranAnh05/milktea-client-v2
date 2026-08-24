import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    link?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex flex-wrap items-center gap-y-2 text-sm font-medium text-gray-500 mb-8 overflow-x-auto pb-2">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <ChevronRight
                                size={16}
                                className="mx-1 text-gray-400 flex-shrink-0"
                            />
                        )}
                        {isLast || !item.link ? (
                            <span className="text-gray-900 font-bold max-w-[200px] sm:max-w-md truncate">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.link}
                                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                            >
                                {index === 0 && <Home size={16} />}
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;