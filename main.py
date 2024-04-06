from flask import Blueprint, render_template, request
from flask_login import login_required, current_user

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html', name=current_user.name)

@main.route("/match")
@login_required
def match():
    data = [
    { "name": "1", "desc": "What are IPv4 addresses and how are they represented?" },
    { "name": "1", "desc": "IPv4 addresses are 32-bit numbers written as dotted decimals, e.g., 154.31.16.13." },
    { "name": "2", "desc": "What is the goal of building network applications" },
    { "name": "2", "desc": "The goal is to learn how to build client/server applications that communicate using sockets" },
    { "name": "3", "desc": "What are some examples of network applications?" },
    { "name": "3", "desc": "Examples include web, email, peer-to-peer (P2P) file sharing." },
    { "name": "4", "desc": "What additional services might an application require from the transport layer?" },
    { "name": "4", "desc": "An application may require additional services like reliable and in-order delivery of packets from the transport layer." },
    { "name": "5", "desc": "How are internet devices identified?" },
    { "name": "5", "desc": "Any internet device can be identified by IP addresses." },
    { "name": "6", "desc": "When developing a network application, what sides of the program does a developer generally have to develop?" },
    { "name": "6", "desc": "A developer generally has to develop both the client side and the server side of the program." },
    { "name": "7", "desc": "What are sockets in the context of network applications?" },
    { "name": "7", "desc": "Sockets are APIs between the application and transport layers" },
    { "name": "8", "desc": "What are the two packages in which transport layer services are bundled in the Internet?" },
    { "name": "8", "desc": "Transport layer services in the Internet are bundled into two packages: TCP (Transmission Control Protocol) and UDP (User Datagram Protocol)." },
    { "name": "9", "desc": "How can processes running on different host machines communicate?" },
    { "name": "9", "desc": "Processes running on different host machines can communicate by sending messages over a network." }]

    return render_template('match.html', data = data)