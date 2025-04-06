import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from './AuthProvider';

function Header() {
  const { currentUser, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          {/* 로고 */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            스마트 러닝 & 바이크 코치
          </Typography>

          {/* 모바일 메뉴 아이콘 */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} component={Link} to="/">홈</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/courses">코스 추천</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/analysis">운동 분석</MenuItem>
              {isAuthenticated && (
                <MenuItem onClick={handleClose} component={Link} to="/profile">프로필</MenuItem>
              )}
              {!isAuthenticated && (
                <MenuItem onClick={handleClose} component={Link} to="/login">로그인</MenuItem>
              )}
            </Menu>
          </Box>

          {/* 데스크탑 메뉴 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" component={Link} to="/">
              홈
            </Button>
            <Button color="inherit" component={Link} to="/courses">
              코스 추천
            </Button>
            <Button color="inherit" component={Link} to="/analysis">
              운동 분석
            </Button>
            
            {isAuthenticated ? (
              <>
                <Typography variant="body1" sx={{ alignSelf: 'center', mr: 2 }}>
                  {currentUser.email}
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  component={Link} 
                  to="/profile"
                >
                  프로필
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                color="secondary" 
                component={Link} 
                to="/login"
              >
                로그인
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;