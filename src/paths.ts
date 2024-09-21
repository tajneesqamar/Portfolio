export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    project: (id: any) => `/project/${id}`, // Use a function for dynamic path
    projects: '/dashboard/projects',
    addProject:'/dashboard/addProject'
  },
  errors: { notFound: '/errors/not-found' },
} as const;
