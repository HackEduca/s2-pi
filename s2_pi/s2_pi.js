/**
 This code was rewritten by Edson Sidnei Sobreira for HackEduca.
 The main part was forked from MrYsLab/s2-pi by Alan Yorinks
 
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

(function (ext) {
    var socket = null;

    var connected = false;

    // an array to hold possible digital input values for the reporter block
    var digital_inputs = new Array(32);
    var myStatus = 1; // initially yellow
    var myMsg = 'not_ready';

    ext.cnct = function (callback) {
        window.socket = new WebSocket("ws://127.0.0.1:9000");
        window.socket.onopen = function () {
            var msg = JSON.stringify({
                "command": "ready"
            });
            window.socket.send(msg);
            myStatus = 2;

            // change status light from yellow to green
            myMsg = 'ready';
            connected = true;

            // initialize the reporter buffer
            digital_inputs.fill('0');

            // give the connection time establish
            window.setTimeout(function() {
            callback();
        }, 1000);

        };

        window.socket.onmessage = function (message) {
            var msg = JSON.parse(message.data);

            // handle the only reporter message from the server
            // for changes in digital input state
            var reporter = msg['report'];
            if(reporter === 'digital_input_change') {
                var pin = msg['pin'];
                digital_inputs[parseInt(pin)] = msg['level']
            }
            console.log(message.data)
        };
        window.socket.onclose = function (e) {
            console.log("Conexão Encerrada");
            socket = null;
            connected = false;
            myStatus = 1;
            myMsg = 'not_ready'
        };
    };

    // Cleanup function when the extension is unloaded
    ext._shutdown = function () {
        var msg = JSON.stringify({
            "command": "shutdown"
        });
        window.socket.send(msg);
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function (status, msg) {
        return {status: myStatus, msg: myMsg};
    };

    // when the connect to server block is executed
    ext.input = function (pin) {
        if (connected == false) {
            alert("Servidor não conectado, digite s2pi no terminal");
        }
        // validate the pin number for the mode
        if (validatePin(pin)) {
            var msg = JSON.stringify({
                "command": 'input', 'pin': pin
            });
            window.socket.send(msg);
        }
    };

    // when the digital write block is executed
    ext.digital_write = function (pin, state) {
        if (connected == false) {
            alert("Servidor não conectado, digite s2pi no terminal");
        }
        console.log("digital write");
        // validate the pin number for the mode
        if (validatePin(pin)) {
            var msg = JSON.stringify({
                "command": 'digital_write', 'pin': pin, 'state': state
            });
            console.log(msg);
            window.socket.send(msg);
        }
    };

    // when the PWM block is executed
    ext.analog_write = function (pin, value) {
        if (connected == false) {
            alert("Servidor não conectado, digite s2pi no terminal");
        }
        console.log("analog write");
        // validate the pin number for the mode
        if (validatePin(pin)) {
            // validate value to be between 0 and 255
            if (value === 'VAL') {
                alert("Os valores PWM devem estar entre 0 e 255");
            }
            else {
                value = parseInt(value);
                if (value < 0 || value > 255) {
                    alert("Os valores PWM devem estar entre 0 e 255");
                }
                else {
                    var msg = JSON.stringify({
                        "command": 'analog_write', 'pin': pin, 'value': value
                    });
                    console.log(msg);
                    window.socket.send(msg);
                }
            }
        }
    };

    // ***Hackeduca --> when the Servo block is executed
    ext.servo = function (pin, value) {
        if (connected == false) {
            alert("Servidor não conectado, digite s2pi no terminal");
        }
        console.log("servo");
        // validate the pin number for the mode
        if (validatePin(pin)) {
            // validate value to be between 0 and 180
            if (value === 'VAL') {
                alert("O ângulo do Servo motor deve ser entre 0 e 180");
            }
            else {
                value = parseInt(value);
                if (value < 0 || value > 180) {
                    alert("O ângulo do Servo motor deve ser entre 0 e 180");
                }
                else {
                    var msg = JSON.stringify({
                        "command": 'servo', 'pin': pin, 'value': value
                    });
                    console.log(msg);
                    window.socket.send(msg);
                }
            }
        }
    };
 
    // when the play tone block is executed
    ext.play_tone = function (pin, frequency) {
        if (connected == false) {
            alert("Servidor não conectado, digite s2pi no terminal");
        }
        // validate the pin number for the mode
        if (validatePin(pin)) {
            var msg = JSON.stringify({
                "command": 'tone', 'pin': pin, 'frequency': frequency
            });
            console.log(msg);
            window.socket.send(msg);
        }
    };

    // when the digital read reporter block is executed
    ext.digital_read = function (pin) {
        if (connected == false) {
            alert("Servidor não conectado, digite s2pi no terminal");
        }
        else {
                return digital_inputs[parseInt(pin)]

        }
    };

    // general function to validate the pin value
    function validatePin(pin) {
        var rValue = true;
        if (pin === 'PIN') {
            alert("Escolha um pinos entre entre 0 e 31.");
            rValue = false;
        }
        else {
            var pinInt = parseInt(pin);
            if (pinInt < 0 || pinInt > 31) {
                alert("Escolha um pinos entre entre 0 e 31.");
                rValue = false;
            }
        }
        return rValue;
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ["w", 'Conectar ao servidor', 'cnct'],
            [" ", 'Define pino %n como entrada', 'input','PIN'],
            [" ", "Define pino digital %n como saída e valor = %m.high_low", "digital_write", "PIN", "0"],
            [" ", "Define pino PWM %n como saída e valor = %n (0 - 255)", "analog_write", "PIN", "0"],
            [" ", "Define pino %n como servo motor e ângulo em %n (0 - 180)", "servo", "PIN", "0"],         
            [" ", "Cria som no pino %n de %n Hz", "play_tone", "PIN", 1000],
            ["r", "Ler pino digital %n", "digital_read", "PIN"]

        ],
        "menus": {
            "high_low": ["0", "1"]

        },
        url: 'https://www.hackeduca.com.br/raspberrypi_scratch/'
    };

    // Register the extension
    ScratchExtensions.register('s2_pi and hackeduca', descriptor, ext);
})({});

