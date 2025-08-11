import React from 'react';
import { Drawer } from 'antd';

const AntdDrawer = ({ title, children, placement = "right", open, setOpen }: any) => {

    const onClose = () => {
        setOpen(false);
    };

    return (
        <Drawer
            title={title}
            placement={placement}
            closable={false}
            onClose={onClose}
            open={open}
            key={placement}
        >
            {children}
        </Drawer>
    );
};

export default AntdDrawer;