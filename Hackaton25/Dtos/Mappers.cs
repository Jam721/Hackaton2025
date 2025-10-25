using Hackaton25.Domain.Models;
using Hackaton25.Dtos.Response;

namespace Hackaton25.Dtos;

public static class Mappers
{
    public static CometResponse MapComet(this Comet model)
    {
        return new CometResponse(
            model.Id, model.Name, 
            model.Designation, model.Description, 
            model.DiscoveryDate, model.Discoverer, 
            model.CreatedAt, model.ImageUrl);
    }

    public static ObservationResponse MapObservation(this Observation model)
    {
        return new ObservationResponse(
            model.ObservationTime,
            model.RightAscension,
            model.Declination,
            model.CometId);
    }

    public static OrbitalParametersResponse MapOrbitalParameters(this OrbitalParameters model)
    {
        return new OrbitalParametersResponse(
            model.SemiMajorAxis,
            model.Eccentricity,
            model.Inclination,
            model.LongitudeOfAscendingNode,
            model.ArgumentOfPeriapsis,
            model.TimeOfPeriapsisPassage,
            model.CometId
            );
    }

    public static CloseApproachResponse MapCloseApproach(this CloseApproach model)
    {
        return new CloseApproachResponse(
            model.ApproachDate,
            model.Distance,
            model.CometId,
            model.OrbitalParametersId
            );
    }
    
    
}