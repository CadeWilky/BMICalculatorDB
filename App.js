import { useState, useEffect } from "react";
  import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
  } from "react-native";
  import * as SQLite from "expo-sqlite";
  
  function openDatabase() {
    if (Platform.OS === "web") {
      return {
        transaction: () => {
          return {
            executeSql: () => {},
          };
        },
      };
    }
  
    const db = SQLite.openDatabase("bmiDB.db");
    return db;
  }
  
  const db = openDatabase();
  

  function Items({}) {
    const [items, setItems] = useState(null);
  
    useEffect(() => {
      db.transaction((tx) => {
        tx.executeSql(
          `select id, date(itemDate) as itemDate, bmi, height, weight from items order by itemDate desc;`,
          [],
          (_, { rows: { _array } }) => setItems(_array)
        );
      });
    }, []);
  
    if (items === null || items.length === 0) {
      return null;
    }
  
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.bmiHistoryHeading}>BMI History</Text>
        {items.map(({ id, itemDate, bmi, height, weight }) => (
          <Text key={id}styles={styles.bmiHistory}>{itemDate}: {bmi} (W: {weight}, H: {height})</Text>
        ))}
      </View>
    );
  }
  
  export default function App() {
    const [weight, setWeight] = useState(null);
    const [height, setHeight] = useState(null);
    const [bmi, setBMI] = useState(null);
    const [bmiStatus, setBMIStatus] = useState(null);
  
    useEffect(() => {
      db.transaction((tx) => {
        tx.executeSql(
          "create table if not exists items (id integer primary key not null, bmi real, weight real, height real, itemDate real);"
        );
      });
    }, []);
  
    const add = () => {
      // is text empty?
      if (weight === null || weight === "" || height === null || height === "") {
        return false;
      }
      const bmiCalculation = () => {
        const BMI = (parseFloat(weight) / (parseFloat(height) * (parseFloat(height)))) * 703;
        setBMI(BMI.toFixed(1));
        if (BMI < 18.5){
          setBMIStatus("Underweight");
        }
        else if(BMI > 18.5 && BMI <24.9) {
          setBMIStatus("Healthy");
        }
        else if(BMI >24.9 && BMI < 29.9){
          setBMIStatus("Overweight");
        }
        else {
          setBMIStatus("Obese");
        }
      }

      const finalBMI = bmiCalculation();

      db.transaction(
        (tx) => {
          tx.executeSql("insert into items (bmi, weight, height, itemDate) values (?, ?, ?, julianday('now'))", [finalBMI, weight, height]);
          tx.executeSql("select * from items order by itemDate desc", [], (_, { rows }) =>
            console.log(JSON.stringify(rows))
          );
        },
      );
    };

    return (
      <View style={styles.container}>
  
        {Platform.OS === "web" ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>
              Expo SQlite is not supported on web!
            </Text>
          </View>
        ) : (
          <SafeAreaView style={styles.container}>
          <Text style={styles.toolbar}>BMI Calculator</Text>
          <ScrollView style={styles.content}>
            <TextInput
              style={styles.input}
              onChangeText={(weight) => setWeight(weight)}
              value={weight}
              placeholder="Weight in Pounds"
            />
            <TextInput
              style={styles.input}
              onChangeText={(height => setHeight(height))}
              value={height}
              placeholder="Height in Inches"
            />
            <TouchableOpacity onPress={()=> add()} style={styles.button}>
              <Text style={styles.buttonText}>Compute BMI</Text>
            </TouchableOpacity>
  
            
            <Text style={styles.results}>{bmi ? 'Body Mass Index is ' + bmi : ''}</Text>
            <Text style={styles.results}>{bmiStatus ? '(' + bmiStatus + ')' : ''}</Text>
            <Items></Items>
          </ScrollView>
        </SafeAreaView>
        )}
      </View>
    );
  }
  


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    toolbar: {
      backgroundColor: '#f4511e',
      color: '#fff',
      textAlign: 'center',
      padding: 25,
      fontSize: 28,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 10,
    },
    preview: {
      backgroundColor: '#bdc3c7',
      flex: 1,
      height: 500,
    },
    input: {
      backgroundColor: '#ecf0f1',
      borderRadius: 3,
      height: 40,
      padding: 5,
      marginBottom: 10,
      flex: 1,
      fontSize: 24,
      textAlign: 'left',
    },
    button: {
      backgroundColor: '#34495e',
      padding: 10,
      borderRadius: 3,
      marginBottom: 30,
    },
    buttonText: {
      color: '#fff',
      fontSize: 24,
      textAlign: 'center'
    },
    assessmentTitle: {
      fontSize: 20,
  
    },
    assessment: {
      fontSize: 20,
      left: 20,
    },
    results: {
      fontSize: 28,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 100,
    },
    bmiHistory: {
      fontSize: 18,
      marginBottom: 8,
      right: 20,
    },
    bmiHistoryHeading: {
      fontSize: 18,
      marginBottom: 8,
    },
    sectionContainer: {
      marginBottom: 16,
      marginHorizontal: 16,
    },
  });