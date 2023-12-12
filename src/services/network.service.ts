const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const network = async(userId:any, token:string) => {
    try {
        const response:any = await axios.get(
          `${baseurl}/api/network/${userId}`,
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