import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Button, Text, View, Dimensions } from "react-native";

const NavigationContext = createContext(null);

const animatedMainPage = new Animated.Value(0);
const animatedTransitionPage = new Animated.Value(1);

const vw = Dimensions.get("window").width;

const TabNavigation = ({ children }) => {
  const [context, setContext] = useState({ page: "A" });
  const [pages, setPages] = useState([]);

  const [transitionPage, setTransitionPage] = useState(null);

  const lastPageUpdate = useRef(context.page);

  useEffect(() => {
    recalculatePages(context.page);
  }, []);

  const components = pages.map((child) => {
    const Component = child.props.component;
    return <Component />;
  });

  useEffect(() => {
    if (transitionPage) {
      const page = lastPageUpdate.current;

      const direction = getTransitionDirection(context.page, page);
      if (direction === "left") {
        animatedMainPage.setValue(0);
        animatedTransitionPage.setValue(-1);

        Animated.parallel([
          Animated.timing(animatedMainPage, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedTransitionPage, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setContext({ page });
          setTransitionPage(null);
          recalculatePages(page);
          animatedMainPage.setValue(0);
          animatedTransitionPage.setValue(1);
        });
      } else if (direction === "right") {
        animatedMainPage.setValue(0);
        animatedTransitionPage.setValue(1);

        Animated.parallel([
          Animated.timing(animatedMainPage, {
            toValue: -1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedTransitionPage, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setContext({ page });
          setTransitionPage(null);
          recalculatePages(page);
          animatedMainPage.setValue(0);
          animatedTransitionPage.setValue(1);
        });
      }
    }
  }, [transitionPage]);

  const changePage = (page) => () => {
    if (page === context.page) return;

    lastPageUpdate.current = page;
    setTransitionPage(page);
  };

  const recalculatePages = (newPage) => {
    const arrWithFirstPage = children.find(
      (child) => child.props.page === newPage
    );

    const otherPages = children.filter((child) => child.props.page !== newPage);

    setPages([arrWithFirstPage, ...otherPages]);
  };

  const getTransitionDirection = (oldPage, newPage) => {
    const oldPageIndex = children.findIndex(
      (page) => page.props.page === oldPage
    );
    const newPageIndex = children.findIndex(
      (page) => page.props.page === newPage
    );

    if (oldPageIndex > newPageIndex) {
      return "left";
    } else {
      return "right";
    }
  };

  return (
    <NavigationContext.Provider value={[context, setContext]}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {pages.map((child, index) => (
          <Animated.View
            key={child.props.page}
            style={{
              width: "100%",
              height: "100%",
              display:
                index === 0 || child.props.page === transitionPage
                  ? "flex"
                  : "none",
              ...(index === 0 && {
                transform: [
                  {
                    translateX: animatedMainPage.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-vw, vw],
                    }),
                  },
                ],
              }),
              ...(child.props.page === transitionPage && {
                transform: [
                  {
                    translateX: animatedTransitionPage.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-(2 * vw), 0],
                    }),
                  },
                ],
              }),
            }}
          >
            {components[index]}
          </Animated.View>
        ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 30,
          paddingTop: 10,
          backgroundColor: "black",
        }}
      >
        <Button title="Page A" onPress={changePage("A")}></Button>
        <Button title="Page B" onPress={changePage("B")}></Button>
        <Button title="Page C" onPress={changePage("C")}></Button>
      </View>
    </NavigationContext.Provider>
  );
};

const TabNavigationPage = ({ page, component }) => {};

TabNavigation.Page = TabNavigationPage;

TabNavigationPage.customName = "TabNavigationPage";

const PageA = () => {
  useEffect(() => {
    console.log("mount A");

    return () => {
      console.log("unmount A");
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Page A</Text>
    </View>
  );
};

const PageB = () => {
  useEffect(() => {
    console.log("mount B");

    return () => {
      console.log("unmount B");
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "blue",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Page B</Text>
    </View>
  );
};

const PageC = () => {
  useEffect(() => {
    console.log("mount C");

    return () => {
      console.log("unmount C");
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "green",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Page C</Text>
    </View>
  );
};

export default function App() {
  return (
    <TabNavigation>
      <TabNavigation.Page page="A" component={PageA} />
      <TabNavigation.Page page="B" component={PageB} />
      <TabNavigation.Page page="C" component={PageC} />
    </TabNavigation>
  );
}
