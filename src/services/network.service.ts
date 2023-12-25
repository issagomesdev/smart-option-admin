const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const network = async(userId:any, token:string, filters:any) => {
    try {
        const response:any = await axios.post(
          `${baseurl}/api/network/${userId}`, filters,
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