
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

// from material UI API page

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

export default function MySwitch(props) {
  return (
    <div style={ "label" in props ? {
      fontSize: 12,
      textAlign: "center",
      backgroundColor: "#AAAAAA20",
      borderRadius: "5px",
      padding: "0px 2px",
      margin: "0 5px",
      color: "#666666",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "120px",
      maxWidth: "120px"
    } : {}}>

      <span style={{ marginBottom: "3px"}}>{props.label}</span>
      <AntSwitch
        {...props}
        inputProps={{ 'aria-label': 'controlled' }}
      />
    </div>)
};