const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const extract = async(userId:any, token:string) => {
    try {
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

export const withdrawal = async(userId:any, token:string) => {
  try {
      const response:any = await axios.get(
        `${baseurl}/api/financial/withdrawal/${userId}`,
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