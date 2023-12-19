const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const users = async(token:string) => {
  try {

      const response:any = await axios.get(
        `${baseurl}/api/dashboard/users`,
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

export const balance = async(token:string, param:any) => {
  try {

      const response:any = await axios.get(
        `${baseurl}/api/dashboard/balance/${param.user.id}/${param.product_id}/${param.period}`,
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
