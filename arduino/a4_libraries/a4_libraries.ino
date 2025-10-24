#include <Keypad.h> // library to read input from keypad
#include <LiquidCrystal.h> // library to control LCD display

const byte ROWS = 4; // four rows
const byte COLS = 3;    // three columns

// define the cymbols on the buttons of the keypads
char keys[ROWS][COLS] = {
  {'1','2','3'},
  {'4','5','6'},
  {'7','8','9'},
  {'*','0','#'}
};

// connect keypad row and column pins to Arduino pins
byte rowPins[ROWS]={7, 6, A0, A1};
byte colPins[COLS]={A2, A3, A4};

// initialize keypad and LCD objects
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);


const char CODE[] = "4826"; // correct password
int inputLen = 0; // records number of digits entered
int failCount = 0; // counts failed attempts
const int MAX_FAILS = 3; // 3 incorrect tries before lockout
const unsigned long LOCKOUT_MS = 10000; // 10 seconds lockout time
unsigned long lockedUntil = 0; // stores when lockout ends

// clear and print two lines on LCD with two input parameters
void displayScreen(const char* line1, const char* line2 = "") {
  lcd.clear(); // clear previous text
  // set cursor to first line and print first message
  lcd.setCursor(0,0);
  lcd.print(line1);

  // set cursor to second line and print second message
  lcd.setCursor(0,1);
  lcd.print(line2);
}

void setup() {
  lcd.begin(16, 2); // initialize LCD (16 cols x 2 rows)
  displayScreen(" ENTER PASSWORD", "Press # to start"); // set up default screen
}

void loop() {
  // system starts only when user presses #
  if (keypad.getKey() == '#') {
    char* inputs = getInput(); // retrieve inputs

    // check if code is correct
    if (isCorrect(inputs)) {
      failCount = 0; // reset failed attempts
      displayScreen(" ACCESS GRANTED", "    UNLOCKED"); // display unlocked message on screen
      delay(800); // short delay before reset

    } else { // incorrect attempt
      failCount++; // increment failed attempt count by 1

      // if attempts are still under max limit
      if (failCount < MAX_FAILS) {
        displayScreen("  ACCESS DENIED", "   Try again"); // display error message
        delay(800); // short delay

      } else { // reach the max fail attempts
        lockedUntil = millis() + LOCKOUT_MS; // set unlock time as 10 sec later
        displayScreen("   LOCKED OUT", "Too many tries"); // display lockout message

        // while 10 seconds isn't up
        while (millis() < lockedUntil) {
          lockoutCountdown(); // show countdown
          delay(200); // update every .2 seconds
        }
        failCount = 0;  // reset fails after timeout
      }

    // reset input length and display screen
    reset();
    }
  }

}

// reads 4 digits from keypad input and returns that input
char* getInput() {
  inputLen = 0; // reset input length to 0
  static char inputs[4]; // store up to 4 characters
  lcd.clear(); // clear previous text
  lcd.print(" ENTER PASSWORD"); // display input prompt
  lcd.setCursor(0, 1); // go to second line
  lcd.print("      ");  // just spacing for centered text

  // loop until all 4 digits have been entered
  while (inputLen < 4) {
    char key = keypad.getKey(); // read key press
    if (key) { // only process valid key press
      inputs[inputLen] = key; // store the key in the array
      inputLen++; // update numbers of digits entered
      lcd.print("*"); // show * for each digit entered
    }
  }
  return inputs; // return the input
}

// checks if the entered digits match the correct CODE
bool isCorrect(char inputs[]) {
  // loop through all digits entered
  for (int i = 0; i < inputLen; i++) {
    // if any digit doesn’t match, return false
    if (inputs[i] != CODE[i]) {
      return false;
    }
  }
  // otherwise, return true
  return true;
}

// displays countdown timer while system is locked
void lockoutCountdown() {
  long timeRemaining = (long)(lockedUntil - millis()); // calculate remaining time
  int secs = (timeRemaining + 999) / 1000; // convert to seconds
  lcd.setCursor(0, 1); // move to second line

  // print remaining seconds
  lcd.print("  Retry in ");
  lcd.print(secs);
  lcd.print("s   ");
}

// resets everything to the start screen
void reset() {
  inputLen = 0; // clear number of entered digits
  displayScreen(" ENTER PASSWORD", "Press # to start"); // show starting message
}