import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import { IoMdEye as Visibility, IoMdEyeOff as VisibilityOff } from "react-icons/io";

const PasswordMUI = (props: any) => {

    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (e: any) => {
        e?.preventDefault();
    };

    const handleChange = (e: any) => {
        if (props?.onChange) {
            props?.onChange(e?.target?.value);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }} style={{ ...props?.style }}>
                <FormControl sx={{ width: props?.expandWidth ? props?.expandWidth : '100%' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">{props?.label}</InputLabel>
                    <OutlinedInput
                        id={`outlined-adornment-password-${props?.name}`}
                        type={showPassword ? 'text' : 'password'}
                        value={props?.value}
                        onChange={handleChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label={props?.label}
                    />
                </FormControl>
            </Box>
        </>
    );
}

export default PasswordMUI