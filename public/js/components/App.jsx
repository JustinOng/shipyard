import React from "react";
import { withRouter, Route, Link } from "react-router-dom";
import { Layout, Menu, Icon, Breadcrumb } from "antd";
const { Content, Sider } = Layout;
const { SubMenu } = Menu;
import "antd/dist/antd.less";
import "../main.css";

import Challenge from "./Challenge/Challenge.jsx";
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSider: false,
      challenges: []
    };
  }

  componentDidMount() {
    fetch("/challenges").then((res) => {
      if (res.status !== 200) {
        return console.error(`Failed to retrieve list of challenges: ${res.status}`);
      }

      return res.json();
    }).then((challenges) => {
      this.setState({ challenges });
    });
  }

  onSiderCollapse(collapsed) {
    this.setState({
      showSider: !collapsed
    });
  }

  render() {
    return (
      <Layout>
        <Sider
          collapsible
          collapsed={ !this.state.showSider }
          onCollapse={ this.onSiderCollapse.bind(this) }
          theme="light"
        >
          <Menu mode="inline">
            {
              Object.values(this.state.challenges).map((category) => {
                return (
                  <SubMenu
                    key={ category.name }
                    title={
                      <span>
                        <Icon type={ category.icon } />
                        <span>{ category.humanName }</span>
                      </span>
                    }
                  >
                    {
                      category.challenges.map((challenge) => {
                        return (
                          <Menu.Item key={ challenge.name }>
                            <Link to={`/${category.name}/${challenge.name}`}>
                              { challenge.humanName }
                            </Link>
                          </Menu.Item>
                        );
                      })
                    }
                  </SubMenu>
                );
              })
            }
          </Menu>
        </Sider>
        { // eslint-disable-next-line react/no-children-prop
        } <Route path="/:category/:challenge" children={({ match }) => {
          const routes = [{ path: "/", breadcrumbName: "Challenges" }];

          // checks whether the category and challenge names are valid
          let validRoute = true;

          const { category, challenge } = match ? match.params : {};
          if (match) {
            // ensure that category is valid
            if (category in this.state.challenges) {
              routes.push({
                path: `/${category}`,
                breadcrumbName: this.state.challenges[category].humanName
              });
              
              // ensure that challenge is valid
              // a little more complex because challenge is an array, not dict
              const foundChallenge = this.state.challenges[category].challenges.filter((c) => {
                return c.name === challenge;
              });
  
              if (foundChallenge.length) {
                routes.push({
                  path: challenge,
                  breadcrumbName: foundChallenge[0].humanName
                });
              } else {
                validRoute = false;
              }
            } else {
              validRoute = false;
            }
          }

          return (
            <Content style={{ padding: "0 50px" }}>
              <Breadcrumb
                style={{ margin: "16px 0" }}
                itemRender={(route, params, routes, paths) => {
                  const lastCrumb = routes.indexOf(route) === routes.length - 1;
                  return lastCrumb ?
                    <span>{route.breadcrumbName}</span>
                    :
                    <Link to={"/"+paths.join("/")}>{route.breadcrumbName}</Link>;
                }}
                routes={ routes }
              />
              <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
                {
                  match && validRoute ?
                    <Challenge challenge={ challenge }/>
                    :
                    "Select a challenge on the left to get started!"
                }
              </div>
            </Content>
          );
        }}/>
      </Layout>
    );
  }
}

export default withRouter(App);
