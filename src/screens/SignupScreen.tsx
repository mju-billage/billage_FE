import { Image, StyleSheet, Text, View } from "react-native";
import SignupButton from "../components/SignupButton";

function SignupScreen() {
        console.log("렌더링됨")

    const pppp = () => {
        console.log("clicked")
    }

    return (
        <View
        style={styles.container}
        >
            <Image 
            source={require("../assets/images/Billage_logo_big.png")}
            style={styles.logo}
            resizeMode="contain"
            />
            <View />
            <View />
            <View>
                <SignupButton type = {"Naver" } onClick = {pppp}/>
                <SignupButton type = {"Kakao" } onClick = {pppp}/>
                <SignupButton type = {"Google"} onClick = {pppp}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    logo: {
        width: 152
    },
    container: {
        flex:1,
        alignItems: "center",
        justifyContent: "space-around"
    }
})

export default SignupScreen