import * as React from 'react';
import Drawer from '@mui/material/Drawer';

type Anchor = 'right';

interface Props {
    children: React.ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function SideBarDrawer({ children, open, setOpen }: Props) {

    const toggleDrawer: any = (open: boolean) => (event?: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event?.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setOpen(open);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={toggleDrawer(false)}
            style={{ zIndex: "9999" }}
        >
            {children}
        </Drawer>
    );
}