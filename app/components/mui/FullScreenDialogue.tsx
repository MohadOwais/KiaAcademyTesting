import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const FullScreenDialog = ({ children, open, onClose, headerTitle, setOpen }: any) => {
    const handleClose = () => {
        onClose();
    };

    React.useEffect(() => {
        if (open) {
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = 'auto';
        }
        return () => {
            document.documentElement.style.overflow = 'auto';
        };
    }, [open]);

    return (
        <React.Fragment>
        <Dialog
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            sx={{
                '& .MuiDialog-paper': {
                    // width: '80%',
                    maxWidth: 'none',
                    height: '80vh',
                    borderRadius: 2,
                    margin: 2,
                }
            }}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                   
                    <Typography sx={{ ml: 2, flex: 1, marginTop: "0.3em" }} variant="h6" component="div">
                        {headerTitle}
                    </Typography>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {children}
        </Dialog>
    </React.Fragment>
    
    );
};

export default FullScreenDialog;
