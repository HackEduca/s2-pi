# s2-pi
## Tutorial para criar Extensão Scratch 2 para o Raspberry Pi
![](https://github.com/sobreira/s2-pi/blob/master/docs/images/logo.png)
![](https://github.com/sobreira/s2-pi/blob/master/docs/images/hackeduca.png)

 https://www.hackeduca.com.br/raspberrypi_scratch/

# s2-pi
## A Demo and Tutorial for Creating  Scratch 2 Extensions For The Raspberry Pi

```
# A; B    # Run A and then B, regardless of success of A
# A && B  # Run B if and only if A succeeded
# A || B  # Run B if and only if A failed
# A &     # Run A in background.
```

To install type:

```
cd /usr/local/lib/python3.5/dist-packages/ && sudo rm -f *.egg ; sudo rm -r  s2_pi* ; cd && sudo rm -r s2-pi ; git clone https://github.com/HackEduca/s2-pi.git && cd /home/pi/s2-pi && sudo python3 setup.py install && sudo systemctl enable pigpiod && sudo systemctl start pigpiod && cd /usr/lib/scratch2/scratch_extensions && sudo rm s2_pi.js ; sudo rm extensions.json ; sudo curl -o s2_pi.js https://raw.githubusercontent.com/HackEduca/s2-pi/master/s2_pi/s2_pi.js && sudo curl -o extensions.json https://raw.githubusercontent.com/HackEduca/s2-pi/master/additional_files/extensions.json && cd /usr/lib/scratch2/medialibrarythumbnails && sudo rm hackeduca.png ; sudo curl -o hackeduca.png https://raw.githubusercontent.com/HackEduca/s2-pi/master/docs/images/hackeduca.png && cd &&  sudo rm -r s2-pi ; s2pi
```