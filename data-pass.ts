export const dataPass = `
$data = {}
def getData (id)
  a = $data[id]
  return a
end
def sendData(id, data)
  return $data[id]= data
end
`;
