import { Image, View, StyleSheet } from "react-native";

function SplashScreen() {
    return (
        <View
            style={styles.logo}
        >
            <Image
                source={require("../assets/images/Billage_logo_big.png")}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    logo: {
        flex:1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: 152,
    },
})

export default SplashScreen