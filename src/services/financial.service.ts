const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const extract = async(userId:any) => {
    try {
        const token = localStorage.getItem('token');
        const response:any = await axios.get(
          `${baseurl}/api/financial/extract/${userId}`,
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