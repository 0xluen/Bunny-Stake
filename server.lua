local socket = require("socket")

local host = "localhost"
local port = 8080

local handle = io.popen("node erc721.js")
local result = handle:read("*a")
handle:close()

print("JavaScript çıktısı:")
print(result)

local rapidjson = require("rapidjson")

result = result:gsub("'", "\"")

local jsonData, pos, err = rapidjson.decode(result)
if jsonData then
    if type(jsonData) == "table" and #jsonData > 0 then
        local ilkEleman = jsonData[1]
        print("İlk Eleman:")
        print(ilkEleman)
    else
        print("JSON dizi verisi bulunamadı veya boş.")
    end
else
    print("JSON parse hatası: ", err)  
end

function handleRequest(client)
    local request = client:receive()
    local response

    if request:find("GET /query") then
        response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello World!"
    else
        response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nPage not found!"
    end

    client:send(response)
    client:close()
end

local server = assert(socket.bind(host, port))

print("Web server running: http://" .. host .. ":" .. port .. "/")

while true do
    local client = server:accept()

    if client then
        handleRequest(client)
    else
    end
end