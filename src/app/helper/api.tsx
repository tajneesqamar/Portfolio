// Define types for query parameters and options
interface QueryParam {
  key: string;
  value: string | number; // Adjust types as needed
}

interface APIRequestOptions {
  query?: QueryParam[];
  isServerSideCall?: boolean;
  authorization?: string;
  includeResponseStatus?: boolean;
}

interface APIResponse<T = any> {
  status?: number;
  data?: T;
}

// Base API endpoint
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to send API requests
const sendAPIRequest = async (
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  payload?: any,
  options?: APIRequestOptions
): Promise<APIResponse> => {
  const requestPayload: { body?: string | null } = {
    body: payload ? JSON.stringify(payload) : null,
  };

  let queryString = '';
  if (method === 'GET') {
    delete requestPayload.body;
  }

  const queryLength = options?.query?.length || 0; // Default to 0 if undefined
  const query = options?.query;

  if (query && queryLength > 0) {
    queryString = '?';
    query.forEach(({ key, value }: QueryParam, index) => {
      queryString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      if (index < queryLength - 1) {
        queryString += '&';
      }
    });
  }

  const fetchHeaders = new Headers(); // Initialize with an empty Headers object

  if (options?.isServerSideCall) {
    const authorization = options?.authorization;
    if (authorization) {
      fetchHeaders.append('Authorization', `Bearer ${authorization}`);
    }
    fetchHeaders.append('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_ENDPOINT}${url}${queryString}`, {
    headers: fetchHeaders, // Use the initialized headers
    method,
    ...requestPayload,
    next: { revalidate: 10 },
  });

  const data: APIResponse = await response.json();

  if (options?.includeResponseStatus) {
    return {
      status: response.status,
      data,
    };
  } else {
    return data;
  }
};

// Function to get all projects
export async function getAllProjects(): Promise<any> {
  const result = await sendAPIRequest('GET', '/projects/all', null, {
    isServerSideCall: true,
  });

  return result; // Assuming the response has a `data` property directly
}
export async function getProjectDetail({ projectId }: any): Promise<any> {
  const result = await sendAPIRequest(
    'GET',

    `/projects/detail/${projectId}`,
    null,
    {
      isServerSideCall: true,
    }
  );

  return result; // Assuming the response has a `data` property
}

// Function to get all Managers
export async function getAllManagers(): Promise<any> {
  const result = await sendAPIRequest('GET', '/managers/all', null, {
    isServerSideCall: true,
  });

  return result; // Assuming the response has a `data` property
}
// Function to add a new project
export async function addProject(formData: any): Promise<any> {
  try {
    // Send a POST request to add the project
    const result = await sendAPIRequest('POST', '/projects/add', formData, {
      isServerSideCall: true,
    });

    if (!result) {
      throw new Error('Failed to add project');
    }

    return result; // Assuming the response has a `data` property
  } catch (error) {
    console.error('Error adding project:', error);
    throw error; // Re-throw the error to be caught in the calling function
  }
}
