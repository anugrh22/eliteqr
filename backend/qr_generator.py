import qrcode

def generate_qr(url):

    img = qrcode.make(url)

    img.save("qr.png")