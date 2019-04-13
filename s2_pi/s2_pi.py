#!/usr/bin/env python3

"""
s2_pi.py

 This code was rewritten by Edson Sidnei Sobreira for HackEduca.
 The main part was forked from MrYsLab/s2-pi by Alan Yorinks

 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

"""
import json
         
import sys
import time
import os
from subprocess import call

import pigpio
import psutil

from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket


# This class inherits from WebSocket.
# It receives messages from the Scratch and reports back for any digital input
# changes.
class S2Pi(WebSocket):
 
    def handleMessage(self):
        # get command from Scratch2
        payload = json.loads(self.data)
        print(payload)
        client_cmd = payload['command']
        # When the user wishes to set a pin as a digital Input
        if client_cmd == 'input':
            pin = int(payload['pin'])
            self.pi.set_glitch_filter(pin, 20000)
            self.pi.set_mode(pin, pigpio.INPUT)
            self.pi.callback(pin, pigpio.EITHER_EDGE, self.input_callback)
        # when a user wishes to set the state of a digital output pin
        elif client_cmd == 'digital_write':
            pin = int(payload['pin'])
            self.pi.set_mode(pin, pigpio.OUTPUT)
            state = payload['state']
            if state == '0':
                self.pi.write(pin, 0)
            else:
                self.pi.write(pin, 1)
        # when a user wishes to set a pwm level for a digital input pin
        elif client_cmd == 'analog_write':
            pin = int(payload['pin'])
            self.pi.set_mode(pin, pigpio.OUTPUT)
            value = int(payload['value'])
            self.pi.set_PWM_dutycycle(pin, value)

        elif client_cmd == 'servo':
            # HackEduca ---> When a user wishes to set a servo:
            # Using SG90 servo:
            # 180° = 2500 Pulses; 0° = 690 Pulses
            # Want Servo 0°-->180° instead of 180°-->0°:
            # Invert pulse_max to pulse_min
            # pulse_width = int((((pulse_max - pulse_min)/(degree_max - degree_min)) * value) + pulse_min)
            # Where:
            # Test the following python code to know your Pulse Range: Replace it in the formula
            # >>>>----------------------->
            # import RPi.GPIO as GPIO
            # import pigpio
            # Pulse = 690 # 0°
            # Pulse = 2500 # 180°
            # pi = pigpio.pi()
            # pi.set_mode(23, pigpio.OUTPUT)
            # pi.set_servo_pulse_width(23, Pulse)
            # pi.stop()
            # <------------------------<<<<<
            pin = int(payload['pin'])
            self.pi.set_mode(pin, pigpio.OUTPUT)
            value = int(payload['value'])
            DegreeMin = 0
            DegreeMax = 180
            PulseMin = 2500
            PulseMax = 690
            Pulsewidth = int((((PulseMax - PulseMin) / (DegreeMax - DegreeMin)) * value) + PulseMin)
            self.pi.set_servo_pulsewidth(pin, Pulsewidth)
            time.sleep(0.01)
            
        # when a user wishes to output a tone
        elif client_cmd == 'tone':
            pin = int(payload['pin'])
            self.pi.set_mode(pin, pigpio.OUTPUT)

            frequency = int(payload['frequency'])
            frequency = int((1000 / frequency) * 1000)
            tone = [pigpio.pulse(1 << pin, 0, frequency),
                    pigpio.pulse(0, 1 << pin, frequency)]

            self.pi.wave_add_generic(tone)
            wid = self.pi.wave_create()

            if wid >= 0:
                self.pi.wave_send_repeat(wid)
                time.sleep(1)
                self.pi.wave_tx_stop()
                self.pi.wave_delete(wid)
        elif client_cmd == 'ready':
            pass
        else:
            print("Comando recebido desconhecido", client_cmd)

    # call back from pigpio when a digital input value changed
    # send info back up to scratch
    def input_callback(self, pin, level, tick):
        payload = {'report': 'digital_input_change', 'pin': str(pin), 'level': str(level)}
        print('callback', payload)
        msg = json.dumps(payload)
        self.sendMessage(msg)

    def handleConnected(self):
        self.pi = pigpio.pi()
        print(self.address, 'conectado')

    def handleClose(self):
        print(self.address, 'encerrado')


def run_server():
    # checking running processes.
    # if the backplane is already running, just note that and move on.
    found_pigpio = False

    for pid in psutil.pids():
        p = psutil.Process(pid)
        if p.name() == "pigpiod":
            found_pigpio = True
            print("pigpiod está sendo executado")
        else:
            continue

    if not found_pigpio:
        call(['sudo', 'pigpiod'])
        print('pigpiod foi iniciado')

    #os.system('scratch2&')
    # dir = os.path.dirname(os.path.abspath(__file__))
    os.system('/usr/bin/scratch2 ' + dir +'/exemplo.sb2' )
    #print ("hello")
    #print (dir)    
    #print (os.system ( os.path.abspath(__file__)))
    
    server = SimpleWebSocketServer('', 9000, S2Pi)
    server.serveforever()


if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        sys.exit(0)

