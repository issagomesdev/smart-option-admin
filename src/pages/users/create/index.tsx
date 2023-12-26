import * as React from 'react';
import BotUsersForm from "src/layouts/components/pages/botUsers/form";
import { Toolbar, Typography, Box, Paper } from "@mui/material";

const Create: React.FC = () => {

  return (
  <Box sx={{ width: '100%',  marginY: '1em', flexGrow: 1 }}>
    <Paper sx={{ width: '100%', mb: 2 }}> 
      <Toolbar sx={{ marginLeft: 2 }}>
        <Typography variant="h6"> Cadastrar Usuário </Typography>
      </Toolbar>
        <BotUsersForm/>
    </Paper>
  </Box>
  );
}

export default Create;
