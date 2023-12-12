
import { useHookstate } from '@hookstate/core';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { globalState } from '../state/store';
import { PresentationView } from '../presentation';
// import { RoomView } from './roomview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function MySelectionTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Presentation" {...a11yProps(0)} />
          <Tab label="Room View" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <PresentationView/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* <RoomView/> */}
      </TabPanel>
    </Box>
  );
}

export function Review(){

    const state = useHookstate(globalState);
    const products = state.products.get()

    return (<>
        <Row>
            {/* <Col sm={3}>
            <div style={{height: 500, overflowY: "scroll"}}>
                {products.map((product) => (
            
                    <img
                        key={product.id}
                        src={product.photo.base64}
                        alt={"not found"}
                        loading="lazy"
                        onClick={() => console.log(product.photo)}
                        style={{
                            cursor: "pointer", 
                            width: "100%",
                            borderRadius: 4,
                            marginTop: 5
                        }}
                    />
    
                ))}
            </div>
            </Col> */}
            <Col>
                <MySelectionTabs/>
            </Col>
        </Row>
        </>);

}