export default {
  async logout(ctx) {
    // Clear all auth cookies
    ctx.cookies.set('jwt', '', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });
    
    ctx.cookies.set('github_token', '', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });
    
    ctx.cookies.set('is_authenticated', '', { 
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });

    ctx.send({ message: 'Logged out successfully' });
  }
}; 