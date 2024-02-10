const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const editAccount = async(values:any, token:string) => {
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

export const updatePass = async(values:any, token:string) => {
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

export const botUsers = async(token:string, search:string = '') => {
  try {

      const response:any = await axios.get(
        `${baseurl}/api/users/users-bot/${search || 'all'}`,
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

export const botUsersWithFilter = async(token:string, filter:any) => {
  try {

      const response:any = await axios.post(
        `${baseurl}/api/users/users-bot`,
        filter,
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

export const botUser = async(id:string, token:string) => {
  try {
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

export const newBotUser = async(body:any, token:string) => {
  const response:any = await axios.post(
    `${baseurl}/api/users/user-bot/`, body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

    return response
}

export const upBotUser = async(body:any, token:string) => {
  const response:any = await axios.patch(
    `${baseurl}/api/users/user-bot/`, body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

    return response
}

export const deleteBotUser = async(id:number, token:string) => {
  const response:any = await axios.delete(
    `${baseurl}/api/users/user-bot/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

    return response
}

export const lockBotUser = async(userID:string, status:string, token:string) => {
  const response:any = await axios.put(
    `${baseurl}/api/users/user-bot/${userID}/${status}`, {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

    return response
}

export const transfUserAdmin = async(body:any, token:string) => {
  const response:any = await axios.post(
    `${baseurl}/api/users/transf-user-admin`, body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

    return response
}