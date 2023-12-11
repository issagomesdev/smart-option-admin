const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const editAccount = async(values:any) => {
    
    const token = localStorage.getItem('token');
    try {

        const response:any = await axios.patch(
          `${baseurl}/api/users/update-user`, values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

          return response
        } catch (error:any) {
            console.error(error)
        }
}

export const updatePass = async(values:any) => {
    
    const token = localStorage.getItem('token');
    try {

        const response:any = await axios.patch(
          `${baseurl}/api/users/update-pass`, values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

          return response
        } catch (error:any) {
            console.error(error)
        }
}

export const botUsers = async() => {
    
  const token = localStorage.getItem('token');
  try {

      const response:any = await axios.get(
        `${baseurl}/api/users/users-bot`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}

export const botUser = async(id:string) => {
  try {
      const token = localStorage.getItem('token');
      const response:any = await axios.get(
        `${baseurl}/api/users/user-bot/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}