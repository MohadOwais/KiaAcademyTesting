import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, Box, InputAdornment, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { get_courses_categories } from '@/app/utils/functions';

const SearchAndDropdowns = ({ set_categoryId, searchText, set_searchText }: any) => {

    const [categoryItems, set_categoryItems] = useState([])

    useEffect(() => {
        get_categories()
    }, [])

    const get_categories = async () => {
        const categories: any = await get_courses_categories()
        set_categoryItems(categories?.data?.data?.map((cat: any) => {
            return { value: cat?.category_id, label: cat?.category_name }
        }))
    }

    const handle_category_change = (e: any) => {
        set_categoryId(e?.target?.value)
    }

    return (
        <Box
            display="flex"
            flexDirection="row"
            gap={3}
            justifyContent="center"
            alignItems="center"
            mt={5}
            flexWrap="wrap"
        >
            <TextField
                variant="outlined"
                placeholder="Search..."
                sx={{
                    width: '400px',
                    borderRadius: '50px',
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '50px',
                        paddingLeft: '10px',
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                onChange={(e: any) => set_searchText(e?.target?.value)}
                value={searchText}
            />
            <FormControl
                variant="outlined"
                sx={{
                    width: '200px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ccc',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                    },
                }}
            >
                <InputLabel>Categories</InputLabel>
                <Select
                    label="Categories"
                    defaultValue=""
                    onChange={handle_category_change}
                >
                    <MenuItem value="">
                        <em>Choose Category</em>
                    </MenuItem>
                    {
                        categoryItems?.map((item: any, i: number) => (
                            <MenuItem value={item?.value} key={i}>{item?.label}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
        </Box>
    );
};

export default SearchAndDropdowns;
