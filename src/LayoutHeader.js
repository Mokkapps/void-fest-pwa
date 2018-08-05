import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

const { Header } = Layout;

const HeaderTitle = styled.h1`
  color: white;
`;

const LayoutHeader = () => (
  <Header>
    <HeaderTitle style={{ color: 'white' }}>Void Fest 2018 Band Reminder</HeaderTitle>
  </Header>
);

export default LayoutHeader;
