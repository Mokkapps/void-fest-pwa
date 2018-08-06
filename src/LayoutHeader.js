import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

const { Header } = Layout;

const Icon = styled.img`
  width: 50px;
  height: 50px;
  margin-right: 20px
  margin-top: 5px;
  float: left;
`;

const HeaderTitle = styled.h1`
  color: black;
`;

const LayoutHeader = () => (
  <Header>
    <Icon src="./void-fest.png" />
    <HeaderTitle><a href="https://www.voidfest.de">Void Fest 2018</a> Band Reminder</HeaderTitle>
  </Header>
);

export default LayoutHeader;
