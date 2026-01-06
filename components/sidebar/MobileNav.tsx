'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export function MobileNav() {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="lg:hidden fixed top-6 left-4 z-50">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 border-2 shadow-lg bg-white dark:bg-zinc-900">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-r-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div onClick={() => setOpen(false)} className="h-full">
                        <Sidebar isMobile />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
